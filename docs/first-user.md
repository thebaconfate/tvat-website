# Creating the first user

The admin section needs an account. The first one (the root user) is created through a
bootstrap route that only works while `BOOTSTRAP_TOKEN` is set and no root user exists yet:

1. Set `BOOTSTRAP_TOKEN` in `.env` to a random value and restart `pnpm dev`.
2. Create the user:

   ```sh
   curl -X POST http://localhost:4321/api/auth/station \
     -H "Content-Type: application/json" \
     -H "x-bootstrap-token: <your BOOTSTRAP_TOKEN>" \
     -d '{"email": "you@example.com", "firstName": "First", "lastName": "Last", "password": "<password>"}'
   ```

   The password needs at least 8 characters, with a lowercase and an uppercase letter, a
   number and a special character.

3. Clear `BOOTSTRAP_TOKEN` again, and log in at <http://localhost:4321/login>.
