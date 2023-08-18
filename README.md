# Back End: Olly's NC News
## Summary
This is a back end project that stores the data of elements of a news site,
including `articles`, `topics`, `comments` and `users`, and provides this information
on a set of endpoints hosted by using **express** and **PostgreSQL**.

## Live Demo
A live demo can be found [here](https://olly-nc-news.onrender.com).

A list of potential endpoints to try are:

| REST          | Endpoint                             | Description                         | Queries                                                        |
|---------------|--------------------------------------|-------------------------------------|----------------------------------------------------------------|
| GET           | `/api`                               | Returns all available endpoints     | None                                                           |
| GET           | `/api/topics`                        | Returns all available topics        | None                                                           |
| GET           | `/api/users`                         | Returns all users                   | None                                                           |
| GET           | `/api/articles`                      | Returns all articles                | `topic : string`<br/>`order : asc/desc`<br/>`sort_by : string` |
| GET<br/>PATCH | `/api/articles/:article_id`          | Returns a selected article by ID    | None                                                           |
| GET<br/>POST  | `/api/articles/:article_id/comments` | Returns all comments for an article | None                                                           |
| DELETE        | `/api/comments/:comment_id`          | Deletes a selected comment by ID    | None                                                           |

## Setup
You will need [VS Code](https://code.visualstudio.com/download) or any other supported JS IDE for this project.
### Cloning and Packages
You may clone this repo using:
```shell
git clone https://github.com/ollycrossley/be-news.git
cd be-news

# If you are on VS Code you can use in the terminal
code .
```
Once cloned and opened, install all the packages by running `npm install`.
### PSQL Setup (skip if you already have PSQL installed)
This project runs on **PSQL** so make sure you have that setup.

You may follow the online guides for setting this up, but I will provide the steps I took below to installing it.

#### For Mac users

[Download](https://postgresapp.com/), install and open the PSQL app. Then type `psql` in your terminal and it should be good to go.

Potential fixes for the `psql` app not running can be fixed with some of these commands:
```shell
brew update
brew doctor
brew install postgresql
```
#### For Ubuntu/WSL users
Open your terminal (not in your IDE) and run `cd`.

Then, run the set of commands below one by one to get started with PSQL:
```shell
# Setup psql 
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createuser --superuser $USER
sudo -u postgres createdb $USER
sudo service postgresql start

# You need to access the psql terminal now, so now use
psql

# User Setup (while in psql terminal)
ALTER USER yourUbuntuUsernameHere WITH PASSWORD 'yourChosenPasswordHere';

# Replace yourUbuntuUsernameHere with your Ubuntu username.
# Replace yourChosenPasswordHere with any password you desire.

# If you see ALTER RESPONSE in the terminal after running the command, you may continue.
# If not, try typing ; and hitting enter.

# To exit the psql mode:
\q

# Setting up secret password file
cd 
touch .pgpass
echo "*:*:*:*:yourChosenPasswordHere" > .pgpass
chmod 0600 .pgpass
```

Any further issues with this installation, please consult the [PSQL docs](https://www.postgresql.org/download/).
### Database setup

In order to access the database locally, create two files in the root directory of the project, with the relevant `PGDATABASE` key:

File 1: `.env.development`
```dotenv
PGDATABASE=nc_news
```
File 2: `.env.test`
```dotenv
PGDATABASE=nc_news_test
```

In your IDE terminal, you now may run `npm run setup-dbs` to create the databases.

Then, to add data to your database, run `npm run seed`.

## Testing
The testing suite used in this project is built on **Jest**, **Jest Extended**, **Jest Ordered** and **Supertest**.

If you would like to run the development tests, run `npm test`.

This will seed the `nc-news-test` database with test data and refer to that for testing.

## Running the server

To run the server locally in your terminal, run `npm start`. You can use **CTRL/CMD+C** in terminal any time to stop the server.

Then use your preferred REST client to query the endpoints through http://localhost:9090/ or for only GET requests, you may simply enter it into your browser with the endpoint.




