import { useEffect } from 'react';

/**
 * Makes a horizontal `overflow-x-auto` track fully own touch drags that
 * start on it, so the page can never scroll vertically mid-swipe.
 *
 * The previous version tried to guess a gesture's direction from its
 * first ~6px of movement and only blocked the page once it read as
 * "horizontal enough". That guess was reported as wrong on a real device:
 * an ordinary swipe often has enough vertical drift in that first instant
 * to lock the wrong way, letting the card visibly drag the page up before
 * the carousel ever takes over.
 *
 * This version doesn't guess. Once a touch starts on the track, every
 * touchmove for that gesture is prevented from reaching the page — full
 * stop, regardless of angle — and `scrollLeft` is driven by hand from the
 * touch delta instead, since preventDefault also cancels the browser's
 * own native touch-scroll for the element.
 *
 * `scroll-snap-type` is suspended for the duration of the drag and
 * restored on release. The track's own CSS sets `snap-x snap-mandatory`
 * so cards settle into place normally — but mandatory snapping doesn't
 * know these `scrollLeft` writes are one continuous gesture, only that
 * the value changed, so left alone it re-snaps back to the nearest card
 * after every single touchmove and the drag never visibly moves. Turning
 * it off mid-drag and back on at touchend gets the drag-follow back
 * without losing the snap-into-place on release.
 *
 * `snapChildren: true` (About/Projects, one big card per view) adds one
 * more thing: on release, plain "restore snap and let it settle" only
 * changes cards once the drag has crossed the halfway point — reported
 * as needing a "complete" full-width drag to advance. A short, deliberate
 * swipe past a small distance threshold should be enough too, so it
 * explicitly steps one card in that direction instead of just falling
 * back to whichever card ends up nearest. Not used for the Tech Wall's
 * tile row (default false) — that's meant to free-scroll, not snap tile
 * by tile, so this step is skipped there.
 */
export function useSwipeLock(ref, { snapChildren = false } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let lastX = 0;
    let dragging = false;
    let scrollLeftAtStart = 0;

    const onStart = (e) => {
      const x = e.touches[0].clientX;
      lastX = x;
      scrollLeftAtStart = el.scrollLeft;
      dragging = true;
      el.style.scrollSnapType = 'none';
    };

    const onMove = (e) => {
      if (!dragging) return;
      const x = e.touches[0].clientX;
      el.scrollLeft -= x - lastX;
      lastX = x;
      // Own the whole gesture from here — no vertical bleed to the page,
      // no matter how the finger drifts partway through the swipe.
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;

      if (snapChildren) {
        const netDelta = el.scrollLeft - scrollLeftAtStart; // px actually scrolled
        const DISTANCE_THRESHOLD = 40; // a "small slide", not a full drag
        const committed = Math.abs(netDelta) > DISTANCE_THRESHOLD;

        if (committed) {
          const cards = Array.from(el.children);
          const startCenter = scrollLeftAtStart + el.clientWidth / 2;
          let activeIndex = 0;
          let closest = Infinity;
          cards.forEach((card, i) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const dist = Math.abs(cardCenter - startCenter);
            if (dist < closest) {
              closest = dist;
              activeIndex = i;
            }
          });

          const dir = netDelta > 0 ? 1 : -1;
          const target = Math.min(cards.length - 1, Math.max(0, activeIndex + dir));
          cards[target]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }

      el.style.scrollSnapType = '';
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [ref, snapChildren]);
}
