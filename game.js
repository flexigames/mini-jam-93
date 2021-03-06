import kaboom from "kaboom";

kaboom({
  background: [10, 10, 20],
  width: 880,
  height: 798,
});

loadSprite("vacation", "vacation.png");
loadSprite("work", "officebuilding.png");
loadSprite("europe", "europe.png");
loadSprite("officeworker", "work.png");
loadSprite("surfing", "surfing.png");

const background = add([
  sprite("europe", {
    height: height(),
  }),
  pos(width() / 2, height() / 2),
  origin("center"),
]);

const connections = add([
  "connection-display",
  origin("topright"),
  pos(width(), 0),
  rect(300, 300),
  color(rgb(20, 20, 50)),
  {
    connections: [],
    get() {
      return this.connections;
    },
    createConnection(location1, location2) {
      this.connections.push(
        add([
          "connection",
          pos(width() - 150, 10 + (this.connections.length + 1) * 30),
          area(),
          origin("center"),
          text(location1.number + "-" + location2.number + " x", {
            size: 24,
            font: "sink",
          }),
          {
            location1,
            location2,
          },
        ])
      );
    },
    deleteConnection({ location1, location2 }) {
      const connectionToDelete = this.connections.find(
        (connection) =>
          (connection.location1 === location1 &&
            connection.location2 === location2) ||
          (connection.location1 === location2 &&
            connection.location2 === location1)
      );

      this.connections = this.connections.filter(
        (connection) =>
          !(
            (connection.location1 === location1 &&
              connection.location2 === location2) ||
            (connection.location1 === location2 &&
              connection.location2 === location1)
          )
      );

      destroy(connectionToDelete);
    },
  },
]);

onClick("connection", (connection) => {
  console.log("connection", connection);
  connections.deleteConnection(connection);
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
const startingLocations = [
  {
    position: vec2(349, 629),
    type: "vacation",
    name: "italy",
  },
  {
    position: vec2(211, 536),
    type: "vacation",
    name: "france",
  },
  {
    position: vec2(81, 674),
    type: "vacation",
    name: "spain",
  },
  {
    position: vec2(313, 477),
    type: "work",
    name: "germany",
  },
  {
    position: vec2(167, 408),
    type: "work",
    name: "uk",
  },
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

  for (const { location1, location2 } of connections.get()) {
    drawLine({
      p1: location1.pos,
      p2: location2.pos,
      width: 8,
      color: rgb(40, 38, 78),
    });
  }

  drawText({
    text: "$" + money,
    size: 24,
    font: "sink",
    color: rgb(255, 255, 255),
  });
});

createLocations();

loop(2, () => {
  const locations = get("location");

  const flights = [];

  for (const connection of connections.get()) {
    if (connection.active) continue;

    connection.reverse = !connection.reverse;

    const from = connection.reverse
      ? connection.location2
      : connection.location1;
    const to = connection.reverse ? connection.location1 : connection.location2;

    const travelers = from.travelers.filter(
      (traveler) => traveler.desire === to.type
    );

    from.travelers = from.travelers.filter(
      (traveler) => traveler.desire !== to.type
    );

    if (travelers.length > 0) {
      createPlane(from, to, travelers, connection);
    }
  }
});

function createLocations() {
  for (const { position, type, name } of startingLocations) {
    const location = add([
      "location",
      pos(position),
      sprite(type, {
        width: 64,
        height: 64,
      }),
      origin("center"),
      area(),
      {
        number: name,
        travelers: [],
        type,
        draw() {
          for (let i = 0; i < this.travelers.length; i++) {
            const traveler = this.travelers[i];

            drawSprite({
              sprite:
                traveler.desire === "vacation" ? "officeworker" : "surfing",
              pos: vec2(this.pos.x, this.pos.y - 64 - 32 * i),
              width: 32,
            });
          }
        },
      },
    ]);

    for (let i = 0; i < parseInt(rand(5)); i++) {
      createTraveler(location, type === "vacation" ? "work" : "vacation");
    }
  }
}

function createTraveler(location, desire) {
  location.travelers.push({
    desire,
  });
}

function createPlane(from, to, passengers, connection) {
  if (!canSpend(10)) return;

  connection.active = true;

  spend(10, from.pos);

  const plane = add([
    "plane",
    pos(from.pos),
    origin("center"),
    area(),
    text(passengers.length, {
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
      connection,
    },
  ]);

  plane.onCollide("location", (location) => {
    if (
      location.pos.x === plane.destination.x &&
      location.pos.y === plane.destination.y
    ) {
      let i = 1;
      for (const traveler of plane.passengers) {
        setTimeout(() => {
          location.travelers.push(traveler);
        }, i * 1000);
        traveler.desire = to.type === "vacation" ? "work" : "vacation";
        i++;
      }
      plane.connection.active = false;
      earn(plane.passengers.length * 5, plane.pos);
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
    if (canSpend(10)) {
      spend(10, location.pos);
      connections.createConnection(start, location);
    }
  }

  start = null;
  end = null;
});

function showMoney(position, amount) {
  const initialY = position.y;
  add([
    pos(position),
    text((amount < 0 ? "-" : "") + "$" + Math.abs(amount), {
      size: 24,
      font: "sink",
    }),
    opacity(),
    color(amount < 0 ? rgb(220, 50, 20) : rgb(20, 220, 50)),
    {
      update() {
        this.pos.y -= 0.5;
        this.opacity -= 0.01;

        if (this.pos.y < initialY - 50) {
          destroy(this);
        }
      },
    },
  ]);
}

function getLocation(pos) {
  const locations = get("location");
  for (const location of locations) {
    if (location.hasPoint(pos)) {
      return location;
    }
  }
}

function canSpend(amount) {
  return money >= amount;
}

function earn(amount, position) {
  money += amount;
  if (position && amount !== 0) {
    showMoney(position, amount);
  }
}

function spend(amount, position) {
  if (canSpend(amount)) {
    money -= amount;
    if (position && amount !== 0) {
      showMoney(position, -amount);
    }
  }
}
