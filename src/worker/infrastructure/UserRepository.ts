import { users } from "@/worker/db/auth-schema";
import { User } from "@/worker/domain/entities";
import { EmailAddress, UserId, UserName } from "@/worker/domain/value-object";
import { DrizzleDb } from "@/worker/types";
import { eq } from "drizzle-orm";

export interface IUserRepository {
  findById(id: UserId): Promise<User>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleDb) {}
  async findById(id: UserId): Promise<User> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id.value))
      .get();
    if (!user) {
      throw new Error(`User with id ${id.value} not found`);
    }
    return User.of(
      UserId.of(user.id),
      UserName.of(user.name),
      EmailAddress.of(user.email),
      user.image,
      user.createdAt,
      user.updatedAt
    );
  }
}
