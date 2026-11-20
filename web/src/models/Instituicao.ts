import {
    DataTypes,
    Model,
    Optional,
    Sequelize
} from "sequelize";

export interface InstituicaoAttributes {
    id: number;
    nome: string;
    endereco?: string;
    telefone?: string;
    tipo: string;
}

export interface InstituicaoCreationAttributes
    extends Optional<
        InstituicaoAttributes,
        "id" | "endereco" | "telefone"
    > {}

export class Instituicao
    extends Model<InstituicaoAttributes, InstituicaoCreationAttributes>
    implements InstituicaoAttributes {

    declare id: number;
    declare nome: string;
    declare endereco?: string;
    declare telefone?: string;
    declare tipo: string;
}

export function initInstituicao(sequelize: Sequelize) {
    Instituicao.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        endereco: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "instituicoes",
        timestamps: true,
    });

    return Instituicao;
}