import kaboom from "kaboom";

kaboom({
  background: [10, 10, 20],
});

let start = null;
let end = null;
let money = 100;

const planeCapacity = 5;
const locationCount = 4;
const locationColors = [
  { r: 242, g: 123, b: 75 },
  { r: 223, g: 47, b: 91 },
  { r: 255, g: 237, b: 90 },
  { r: 0, g: 140, b: 204 },
];

onDraw(() => {
  if (start && end) {
    drawLine({
      p1: start.pos,
      p2: end,
      width: 4,
      color: rgb(160, 158, 213),
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

  drawText({
    text: "$" + money,
    size: 24,
    font: "sink",
    color: rgb(255, 255, 255),
  });
});

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
    const numberOfPassengers = Math.min(
      departingLocation.travelers[destination.number],
      5
    );
    departingLocation.travelers[destination.number] -= numberOfPassengers;

    createPlane(departingLocation, destination, numberOfPassengers);
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

      location.travelers[j] = parseInt(rand(10));
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
    origin("center"),
    area(),
    text(passengers, {
      size: 24,
      font: "sink",
    }),
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
      money += plane.passengers * 5;
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
    if (money >= 10) {
      money -= 10;
      start.addConnection(location);
    }
  }

  start = null;
  end = null;
});

function getLocation(pos) {
  const locations = get("location");
  for (const location of locations) {
    if (location.hasPoint(pos)) {
      return location;
    }
  }
}
