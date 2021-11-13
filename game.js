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
      rect(32, 32),
      origin('center'),
      area(),
      color(30, 20, 20),
    ]);
  }
}

let start = null;
let end = null;
let connections = []

onMouseDown((pos) => {
  const location = getLocation(pos)
  if (!start && location) {
    start = location
  }
});
onMouseMove((pos) => (end = pos));
onMouseRelease((pos) => {
  const location = getLocation(pos)

  if (location && start !== location.pos) {
    console.log('adding conncetion')
    connections.push({
      start,
      end: location
    })
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

  for(const connection of connections) {
    drawLine({
      p1: connection.start.pos,
      p2: connection.end.pos,
      width: 8,
      color: rgb(255, 0, 0),
    })
  }
});

function getLocation(pos){
  const locations = get('location');
  for (const location of locations) {
    if (location.hasPoint(pos)) {
      return location
    }
  }
}
