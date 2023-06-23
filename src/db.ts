import { Sequelize, DataTypes, Model } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from "./config";

const sequelize = new Sequelize(DB_NAME!, DB_USER!, DB_PASS!, {
  host: DB_HOST!,
  dialect: "mysql",
});

export class Track extends Model {
  public ISRC!: string;
  public imageUri!: string;
  public title!: string;
}

Track.init(
  {
    ISRC: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    imageUri: DataTypes.STRING,
    title: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "track",
  }
);

export class Artist extends Model {
  public name!: string;
  public trackISRC!: string;
}

Artist.init(
  {
    name: DataTypes.STRING,
    trackISRC: {
      type: DataTypes.STRING,
      references: {
        model: Track,
        key: "ISRC",
      },
    },
  },
  {
    sequelize,
    modelName: "artist",
  }
);

export class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

Artist.belongsTo(Track, {
  foreignKey: "trackISRC",
});
Track.hasMany(Artist);

sequelize.sync();
