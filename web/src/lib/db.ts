import { Sequelize } from "sequelize";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("A variável de ambiente DATABASE_URL não está definida.");
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

export default sequelize;