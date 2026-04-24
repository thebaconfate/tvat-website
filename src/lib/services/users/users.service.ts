import { database } from "@/lib/database";
import type { NewUserData, UserData } from "@/lib/domain/users";

type UserDataWithPassword = UserData & { password: string };

class UserService {
  async rootExists(): Promise<boolean> {
    const query = `
    SELECT 1
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.name = 'root'
    LIMIT 1
    `;
    const result = await database.query(query);
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async createUser(newUser: NewUserData) {
    const query = `
    WITH new_user AS (
        INSERT INTO users (
            email,
            password,
            first_name,
            last_name,
            role_id
        )
        SELECT
            $1,
            $2,
            $3,
            $4,
            r.id
        FROM roles r
        WHERE r.name = $5
        RETURNING *
    )
    SELECT
        u.id,
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        r.name AS role
    FROM new_user u
    JOIN roles r ON r.id = u.role_id
    `;
    const params = [
      newUser.email,
      newUser.password,
      newUser.firstName,
      newUser.lastName ?? null,
      newUser.role,
    ];
    const result = await database.query<UserData>(query, params);
    const [user] = result.rows;
    return user ?? null;
  }
  async getUserById(userId: number): Promise<UserData | null> {
    const query = `
    SELECT
        u.id,
        u.email,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        r.name AS role
    FROM users
    JOIN roles r ON r.id = u.role_id
    WHERE id = $1
    LIMIT 1;
    `;
    const result = await database.query<UserData>(query, [userId]);
    const [user] = result.rows;
    return user ?? null;
  }

  async getUserByEmail(email: string) {
    const query = `
    SELECT
        u.id,
        u.email,
        u.password,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        r.name as role
    FROM users
    JOIN roles r ON r.id = u.role_id
    WHERE email = $1
    LIMIT 1;`;
    const result = await database.query<UserDataWithPassword>(query, [email]);
    const [user] = result.rows;
    return user ?? null;
  }

  async editUser(user: Partial<UserData>) {
    // TODO: implement this
  }
  async deleteUser(userId: number) {
    // TODO: implement this
  }
}

export const userService = new UserService();
