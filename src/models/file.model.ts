import { getModelForClass, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export class File extends TimeStamps {
    @prop({ required: true })
    public _id!: string;

    @prop({ required: true })
    public path!: string;

    @prop({ required: true })
    public mime!: string;
}

const FileModel = getModelForClass(File)

export default FileModel