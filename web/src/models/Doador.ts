
import {
    DataTypes,
    Model,
    Optional,
    Sequelize
} from "sequelize";

export interface DoadorAttributes {
    id: number;
    usuarioId: number;
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    endereco: string;
}

export interface DoadorCreationAttributes
    extends Optional<DoadorAttributes, "id"> {}

export class Doador
    extends Model<DoadorAttributes, DoadorCreationAttributes>
    implements DoadorAttributes {

    declare id: number;
    declare usuarioId: number;
    declare razaoSocial: string;
    declare nomeFantasia: string;
    declare cnpj: string;
    declare endereco: string;
}

export function initDoador(sequelize: Sequelize) {
    Doador.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        razaoSocial: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        nomeFantasia: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        cnpj: {
            type: DataTypes.STRING(18),
            allowNull: false,
            unique: true,
        },
        endereco: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "doadores",
        timestamps: true,
    });

    return Doador;
}
