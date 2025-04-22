# Projects

There are 5 distinctive projects found in this repository.

# Docker

Some of the project are using a Postgres database and as such will rely on Docker. If you don't have Docker setup already, please [download and install it](https://www.docker.com/products/docker-desktop/).

Once done, run `docker compose up -d` from your CLI.

## Basic

To setup the dependencies run `npm i` from the `basic` folder.

Create a `.env` file in the same folder and add the following content:

```
OPENAI_API_KEY=""
WEATHER_API=""
NEXT_PUBLIC_OPENCAGE_API_KEY=""
```

- Visit [https://platform.openai.com](https://platform.openai.com) to obtain the OpenAI API key.
- Visit [https://www.weatherapi.com](https://www.weatherapi.com) to obtain the Weather API key.
- Visit [https://opencagedata.com](https://opencagedata.com) to obtain the OpenCage API key.

Then run `npm run dev` and navigate to `localhost:3000`.

This application showcases the following features:

- Content Generation
- Chat
- Structure Output
- Function/Tool Calling

## Expenses

To setup the dependencies run `npm i` from the `expenses` folder. Make sure that you have Docker running + have run the docker compose command.

Create a `.env` file in the same folder and add the following content:

```
OPENAI_API_KEY=""
DATABASE_URL="postgres://postgres:password@localhost:54320/expenses"
```

> Note that the database port is 54320.

Once confirmed, run `npm run db`. This command should setup the necessary tables as well as seed the data.

Start the project by running `npm run dev` and then navigate to `localhost:3000`.

## Expenses Advanced

To setup the dependencies run `npm i` from the `expenses-advanced` folder. Make sure that you have Docker running + have run the docker compose command.

Create a `.env` file in the same folder and add the following content:

```
OPENAI_API_KEY=""
POSTGRES_URL=postgresql://postgres:password@localhost:54320/expenses-advanced
```

> Note that the database port is 54320.

Once confirmed, run `npm run db`. This command should setup the necessary tables as well as seed the data.

Start the project by running `npm run dev` and then navigate to `localhost:3000`.

## RAG

To setup the dependencies run `npm i` from the `rag` folder. Make sure that you have Docker running + have run the docker compose command.

Create a `.env` file in the same folder and add the following content:

```
OPENAI_API_KEY=""
DATABASE_URL=postgresql://postgres:password@localhost:54320/rag
```

> Note that the database port is 54320.

Once confirmed, run `npm run db`. This command should setup the necessary tables as well as seed the data.

Start the project by running `npm run dev` and then navigate to `localhost:3000`.

## e-commerce

To setup the dependencies run `npm i` from the `ecommerce` folder.

Once done, execute `npm run dev` and navigate to `localhost:3000`
