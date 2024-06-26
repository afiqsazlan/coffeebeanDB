import {db} from "../../../config/db.js";
import {roasters} from "../../../db/schema/roasters.js";
import {eq} from "drizzle-orm";
import {addRoasterRequest, updateRoasterRequest} from './types.js'

const findManyRoasters = async () => {
    return db.select().from(roasters);
};

const addRoaster = async (data: addRoasterRequest) => {
    return db.insert(roasters).values(data).returning();
};

const findOneRoaster = async (id:number) => {
    return db.select().from(roasters).where(eq(roasters.id, id));
};

const updateRoaster = async (data:updateRoasterRequest, id:number) => {
    return db.update(roasters).set(data).where(eq(roasters.id, id)).returning();
}

const deleteRoaster = async (id:number) => {
    return db.delete(roasters).where(eq(roasters.id, id)).returning();
}

export {findManyRoasters, addRoaster, findOneRoaster, updateRoaster, deleteRoaster};