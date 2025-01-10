import {Schema, model} from "mongoose";

export interface IUser {
  email: string;
  password: string;
  refreshToken?: string[];
}

const userSchema = new Schema<IUser>({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  refreshToken: {type: [String], default: []}
});
userSchema.index({ email: 1 }, { unique: true });

export default model<IUser>("Users", userSchema);