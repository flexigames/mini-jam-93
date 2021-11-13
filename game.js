import kaboom from 'kaboom';

kaboom({
  background: [240, 220, 220],
});

let start = null;
let end = null;
let connections = [];

createLocations();

function createLocations() {
  const locationCount = 5;
  for (let i = 1; i < locationCount + 1; i++) {
    const position = new vec2(
      (i * width()) / (locationCount + 1),
      rand(height())
    );

    const location = add([
      'location',
      pos(position),
      rect(32, 32),
      origin('center'),
      area(),
      color(30, 20, 20),
      {
        travellers: parseInt(rand(2)),
        connections: [],
        addConnection(location) {
          this.connections = [...this.connections, location];
        },
      },
    ]);

    const travellerText = add([
      pos(position.x, position.y - 32),
      origin('center'),
      text('test', {
        size: 24,
        font: 'sink',
        color: 'black',
      }),
      color(30, 20, 20),
    ]);

    travellerText.onUpdate(() => {
      travellerText.text = location.travellers;
    });
  }
}

onMouseDown((pos) => {
  const location = getLocation(pos);
  if (!start && location) {
    start = location;
  }
});
onMouseMove((pos) => (end = pos));
onMouseRelease((pos) => {
  const location = getLocation(pos);

  if (location && start.pos !== location.pos) {
    start.addConnection(location);
  }

  start = null;
  end = null;
});

onDraw(() => {
  if (start && end) {
    drawLine({
      p1: start.pos,
      p2: end,
      width: 4,
      color: rgb(0, 0, 255),
    });
  }

  const locations = get('location');

  for (const location of locations) {
    for (const connection of location.connections) {
      drawLine({
        p1: location.pos,
        p2: connection.pos,
        width: 8,
        color: rgb(0, 255, 0),
      });
    }
  }
});

function getLocation(pos) {
  const locations = get('location');
  for (const location of locations) {
    if (location.hasPoint(pos)) {
      return location;
    }
  }
}
