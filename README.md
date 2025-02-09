GoodOnyx
- 
MonoRepo for running the Good Onyx application.

Root Level
- Taskfile and DocketTasks cover language agnostic commands including docker build, setup, DB migration, and dev env.
- docker-compose file controls the core dependencies, it uses keydb as a open source Redis alternative.
- The app uses Drizzle ORM against a PostgreSQL db, not included in the docker compose file. 

Apps:
- /web
    - NextJS application with http forwarding.
- /server
    - ExpressJS appplication that controls DB interactions and enqueueing jobs via BullMQ/KeyDB
- /playwright
    - built off of Playwright docker image with BullMQ queue and workers to run Playwright and Cheerio html scrapers to get offers, auctions, and bids.