
import {
    DataTypes,
    Model,
    Optional,
    Sequelize
} from "sequelize";

export type StatusDoacao =
    | "PENDENTE"
    | "ENCAMINHADA"
    | "ENTREGUE"
    | "CANCELADA";

export interface DoacaoAttributes {
    id: number;
    doadorId: number;
    dataDoacao: Date;
    dataValidade: Date;
    status: StatusDoacao;
    observacoes?: string;
}

export interface DoacaoCreationAttributes
    extends Optional<
        DoacaoAttributes,
        "id" | "dataDoacao" | "status" | "observacoes"
    > {}

export class Doacao
    extends Model<DoacaoAttributes, DoacaoCreationAttributes>
    implements DoacaoAttributes {

    declare id: number;
    declare doadorId: number;
    declare dataDoacao: Date;
    declare dataValidade: Date;
    declare status: StatusDoacao;
    declare observacoes?: string;
}

export function initDoacao(sequelize: Sequelize) {
    Doacao.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        doadorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "doadores",
                key: "id",
            },
        },
        dataDoacao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dataValidade: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "PENDENTE",
            validate: {
                isIn: [[
                    "PENDENTE",
                    "ENCAMINHADA",
                    "ENTREGUE",
                    "CANCELADA"
                ]],
            },
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: "doacoes",
        timestamps: true,
    });

    return Doacao;
}
