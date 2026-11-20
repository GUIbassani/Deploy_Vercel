import { Sequelize } from "sequelize";
import path from "node:path";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(
    process.cwd(),
    "database",
    "reaproveita.db"
  ),
  logging: false,
});

export default sequelize;