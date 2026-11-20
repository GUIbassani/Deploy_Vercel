
import {
    DataTypes,
    Model,
    Optional,
    Sequelize
} from "sequelize";

export type StatusDistribuicao =
    | "ENCAMINHADA"
    | "ENTREGUE"
    | "CANCELADA";

export interface DistribuicaoAttributes {
    id: number;
    doacaoId: number;
    instituicaoId: number;
    dataEncaminhamento: Date;
    dataEntrega?: Date;
    status: StatusDistribuicao;
}

export interface DistribuicaoCreationAttributes
    extends Optional<
        DistribuicaoAttributes,
        "id" | "dataEntrega" | "status"
    > {}

export class Distribuicao
    extends Model<
        DistribuicaoAttributes,
        DistribuicaoCreationAttributes
    >
    implements DistribuicaoAttributes {

    declare id: number;
    declare doacaoId: number;
    declare instituicaoId: number;
    declare dataEncaminhamento: Date;
    declare dataEntrega?: Date;
    declare status: StatusDistribuicao;
}

export function initDistribuicao(sequelize: Sequelize) {
    Distribuicao.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        doacaoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: "doacoes",
                key: "id",
            },
        },
        instituicaoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "instituicoes",
                key: "id",
            },
        },
        dataEncaminhamento: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dataEntrega: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "ENCAMINHADA",
            validate: {
                isIn: [[
                    "ENCAMINHADA",
                    "ENTREGUE",
                    "CANCELADA"
                ]],
            },
        },
    }, {
        sequelize,
        tableName: "distribuicoes",
        timestamps: true,
    });

    return Distribuicao;
}
