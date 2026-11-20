
import {
    DataTypes,
    Model,
    Optional,
    Sequelize
} from "sequelize";

export type TipoUsuario = "ADMIN" | "DOADOR";

export interface UsuarioAttributes {
    id: number;
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    tipoUsuario: TipoUsuario;
}

export interface UsuarioCreationAttributes
    extends Optional<UsuarioAttributes, "id"> {}

export class Usuario
    extends Model<UsuarioAttributes, UsuarioCreationAttributes>
    implements UsuarioAttributes {

    declare id: number;
    declare nome: string;
    declare email: string;
    declare senha: string;
    declare telefone: string;
    declare tipoUsuario: TipoUsuario;
}

export function initUsuario(sequelize: Sequelize) {
    Usuario.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        senha: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        tipoUsuario: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "DOADOR",
            validate: {
                isIn: [["ADMIN", "DOADOR"]],
            },
        },
    }, {
        sequelize,
        tableName: "usuarios",
        timestamps: true,
    });

    return Usuario;
}
