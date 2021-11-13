import kaboom from 'kaboom';

kaboom({
  background: [240, 220, 220],
});

let start = null;
let end = null;

createLocations();

loop(1, () => {
  const locations = get('location');

  const departingLocations = [];

  for (const location of locations) {
    if (location.connections.length > 0 && location.travellers > 0) {
      departingLocations.push(location);
    }
  }

  for (const departingLocation of departingLocations) {
    const destination =
      departingLocation.connections[
        parseInt(rand(departingLocation.connections.length))
      ];
    departingLocation.travellers--;

    createPlane(departingLocation.pos, destination.pos, 1);
  }
});

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

    add([
      pos(position.x, position.y - 32),
      origin('center'),
      text('test', {
        size: 24,
        font: 'sink',
        color: 'black',
      }),
      color(30, 20, 20),
      {
        update() {
          this.text = location.travellers;
        },
      },
    ]);
  }
}

function createPlane(from, to, passengers = 1) {
  const plane = add([
    'plane',
    pos(from),
    rect(16, 16),
    origin('center'),
    area(),
    color(100, 20, 20),
    {
      update() {
        this.moveTo(to, 200);
      },
      destination: to,
      passengers,
    },
  ]);

  plane.onCollide('location', (location) => {
    if (
      location.pos.x === plane.destination.x &&
      location.pos.y === plane.destination.y
    ) {
      location.travellers += plane.passengers;
      destroy(plane);
    }
  });

  return plane;
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
