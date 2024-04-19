FROM node:lts-bookworm
SHELL ["/bin/bash", "-c"]

# Install dependencies
RUN apt-get update -y && apt-get install -y wget xvfb unzip jq curl

# Install Google Chrome dependencies
RUN apt-get install -y libxss1 libappindicator1 libgconf-2-4 \
    fonts-liberation libasound2 libnspr4 libnss3 libx11-xcb1 libxtst6 lsb-release xdg-utils \
    libgbm1 libnss3 libatk-bridge2.0-0 libgtk-3-0 libx11-xcb1 libxcb-dri3-0

# Fetch the latest version numbers and URLs for Chrome and ChromeDriver
RUN curl -s https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json > /tmp/versions.json

RUN CHROME_URL=$(jq -r '.channels.Stable.downloads.chrome[] | select(.platform=="linux64") | .url' /tmp/versions.json) && \
    wget -q --continue -O /tmp/chrome-linux64.zip $CHROME_URL && \
    unzip /tmp/chrome-linux64.zip -d /opt/chrome

RUN chmod +x /opt/chrome/chrome-linux64/chrome

RUN CHROMEDRIVER_URL=$(jq -r '.channels.Stable.downloads.chromedriver[] | select(.platform=="linux64") | .url' /tmp/versions.json) && \
    wget -q --continue -O /tmp/chromedriver-linux64.zip $CHROMEDRIVER_URL && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/chromedriver && \
    chmod +x /opt/chromedriver/chromedriver-linux64/chromedriver

# Set up Chromedriver Environment variables
ENV CHROMEDRIVER_DIR /opt/chromedriver
ENV PATH $CHROMEDRIVER_DIR:$PATH

# Clean up
RUN rm /tmp/chrome-linux64.zip /tmp/chromedriver-linux64.zip /tmp/versions.json

# Now install testabulous

# Default environment variables
ENV TESTABULOUS_API_BASE_URL=
ENV TESTABULOUS_API_KEY=
ENV TESTABULOUS_PROJECT_ID=
ENV TESTABULOUS_TEST_SCRIPT_DATA_ID=
ENV TESTABULOUS_UPLOAD_RESULTS=true

RUN mkdir /app
RUN mkdir /testabulous
COPY package.json /app/package.json
COPY dist /app/dist
COPY drizzle /app/drizzle
COPY resources /app/resources

WORKDIR /app
RUN npm install

WORKDIR /app/dist
ENTRYPOINT ["node", "index.js", "--root-dir", "/testabulous", "remote"]
