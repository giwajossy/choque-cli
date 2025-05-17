Choque-CLI
----------

An open-source CLI tool designed to keep your servers awake, with support for configurable intervals, persistent logging, and summary reporting. It is lightweight, extensible, and ideal for hobby projects. 

#### Potential Use Cases

- Keep Heroku or Railway free dynos alive
- Monitor uptime of microservices
- Test latency for internal services
- Run health-checks for development/staging URLs<br><br>
---

![Choque-cli](https://res.cloudinary.com/dd3hmuucq/image/upload/v1747446940/choque-cli/Screenshot_2025-05-17_at_02.45.54_va1vzi.png)

Features
--------
- Lightweight Design: Uses efficient HEAD requests to reduce resource consumption.
- Colorized Logging: Records ping details with timestamps, status, and response times in plain text.
- Flexible Scheduling: Set custom ping intervals (1 minute to 10 hours) per URL or use a default.
- Multiple URL Support: Easily ping multiple URLs at the same time.


Installation
------------

- Clone the repository
  ```
  git clone https://github.com/giwajossy/choque-cli.git
  cd choque-cli
  ```

- Install dependencies && Run build
    ```
    yarn install
    yarn run build
    ```


Usage
-----
- Add a URL to ping:
    ```
    npx choque add --url https://example.com --interval 300
    ```
    _Interval is in seconds [e.g., 300 = 5 minutes]_

- Start pinging:
    ```
    npx choque start
    ```
    _Pings all configured URLs, with logs in console and `logs/choque.log`_

- View a summary report:
    ```
    npx choque report
    ```


### Logs
----
- Stored in `logs/choque.log`.
- Format: `[timestamp] [URL] [status] [statusCode] [responseTime] [error]`.
- Example: `2025-05-16T06:41:00Z https://yourapp.render.com SUCCESS 200 120ms`.

### Reports
-------
- Run `npx choque report` to see a summary:

```
 --- Choque Report (2025-05-17) ---
  Total Pings: 4
  Successes: 2
  Failures: 2
  Average Response Time: 50.43ms
```


Contributing
------------

To help make Choque-cli even better, please [check out the guidelines](https://github.com/giwajossy/choque-cli/blob/main/CONTRIBUTING.md) on how to contribute. Thank you ❤️

License
-------
Choque-cli is licensed under the [MIT License](https://github.com/giwajossy/choque-cli/blob/main/LICENSE).
