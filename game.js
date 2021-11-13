import kaboom from "kaboom";

kaboom({
  background: [10, 10, 20],
});

let start = null;
let end = null;

const locationCount = 4;
const locationColors = [
  { r: 242, g: 123, b: 75 },
  { r: 223, g: 47, b: 91 },
  { r: 255, g: 237, b: 90 },
  { r: 0, g: 140, b: 204 },
];

createLocations();

loop(1, () => {
  const locations = get("location");

  const flights = [];

  for (const departingLocation of locations) {
    for (const destination of departingLocation.connections) {
      if (departingLocation.travelers[destination.number] > 0) {
        flights.push([departingLocation, destination]);
      }
    }
  }

  for (const [departingLocation, destination] of flights) {
    departingLocation.travelers[destination.number]--;

    createPlane(departingLocation, destination, 1);
  }
});

function createLocations() {
  for (let i = 0; i < locationCount; i++) {
    const position = new vec2(
      rand(width() - 200) + 100,
      rand(height() - 200) + 100
    );

    const location = add([
      "location",
      pos(position),
      rect(32, 32),
      origin("center"),
      area(),
      color(locationColors[i]),
      {
        number: i,
        travelers: {},
        connections: [],
        addConnection(location) {
          this.connections = [...this.connections, location];
        },
      },
    ]);

    let posY = position.y;
    for (let j = 0; j < locationCount; j++) {
      if (j === i) continue;

      location.travelers[j] = parseInt(rand(2));
      posY += 32;
      add([
        pos(position.x, posY),
        origin("center"),
        text("0", {
          size: 24,
          font: "sink",
          color: "black",
        }),
        color(locationColors[j % locationColors.length]),
        {
          update() {
            this.text = location.travelers[j];
          },
        },
      ]);
    }
  }
}

function createPlane(from, to, passengers = 1) {
  const plane = add([
    "plane",
    pos(from.pos),
    rect(16, 16),
    origin("center"),
    area(),
    color(locationColors[to.number]),
    {
      update() {
        this.moveTo(to.pos, 200);
      },
      destination: to.pos,
      passengers,
    },
  ]);

  plane.onCollide("location", (location) => {
    if (
      location.pos.x === plane.destination.x &&
      location.pos.y === plane.destination.y
    ) {
      const possibleDestinations = Object.keys(location.travelers);
      const randomDestination =
        possibleDestinations[parseInt(rand(possibleDestinations.length))];
      location.travelers[randomDestination] += plane.passengers;
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

  if (location && start?.pos !== location.pos) {
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
      color: rgb(220, 220, 255),
    });
  }

  const locations = get("location");

  for (const location of locations) {
    for (const connection of location.connections) {
      drawLine({
        p1: location.pos,
        p2: connection.pos,
        width: 8,
        color: rgb(220, 220, 255),
      });
    }
  }
});

function getLocation(pos) {
  const locations = get("location");
  for (const location of locations) {
    if (location.hasPoint(pos)) {
      return location;
    }
  }
}
