import kaboom from 'kaboom';

kaboom({
  background: [240, 220, 220],
});

createLocations();

function createLocations() {
  const locationCount = 2;
  for (let i = 1; i < locationCount + 1; i++) {
    add([
      'location',
      pos((i * width()) / (locationCount + 1), height() / 2),
      circle(32),
      origin('center'),
      color(30, 20, 20),
    ]);
  }
}

let start = null;
let end = null;

onMouseDown((pos) => {
  if (!start) start = pos;
});
onMouseMove((pos) => (end = pos));
onMouseRelease(() => {
  start = null;
  end = null;
});

onDraw(() => {
  if (start && end) {
    drawLine({
      p1: start,
      p2: end,
      width: 4,
      color: rgb(0, 0, 255),
    });
  }
});
