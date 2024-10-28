# Welcome to your Native Map Benefits App 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Setting up Mock Service

1. Go to [mockable.io](https://www.mockable.io/)

2. Select [Try now!](https://www.mockable.io/a/#/try)

3. Configure name for your mock endpoint with "my-benefits" (stricly necessary to load mock data in this application)

4. Select GET Method

5. Copy response object from [benefits.json](./benefits.json)

6. Save changes & start mock service


## Configuring API_URL

1. Copy mock URL obtained from [mockable.io](https://www.mockable.io/)

2. Go to .env file & replace API_URL values with the mock endpoint value.

3. Use "http" extension if the application is running in local environment.


## Configuring Android Emulator Device:

1. Find "Set Location" section on your emulator device

2. Add Latitude: -12.082397011861229

3. Add Longitude: -77.03107054634789

4. From your emulator device go to Google Maps application and validates the current mocked location

5. Now you are able to run the application


## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app on Android (make sure your emulator device is ready to run the application)

   ```bash
    npm run android
   ```
