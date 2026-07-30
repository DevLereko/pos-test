# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

---

## First-Time Setup

Before starting, ensure you have the following installed:

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [JDK 17+](https://adoptium.net/)
- iOS Simulator or Xcode (for iOS development, macOS only)

### Android Configuration
1. Install Android SDK Platform 36
2. Install Android SDK Build-Tools 36.0.0  
3. Install Android NDK 27.1.12297006
4. Configure `JAVA_HOME` environment variable

### Install Dependencies
```bash
npm install
```

---

## Getting Started

### Development
```bash
npx expo run:android
```
This creates and installs a development build on your Android device/emulator.

### Alternative Methods
In the output, you'll find options to open the app in a:
- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) (limited sandbox)

---

## Prebuild Native Projects

Run a prebuild whenever:
- Adding or removing Expo native modules
- Updating Expo SDK versions
- Changing app configuration in `app.json` or `app.config.ts`
- Regenerating Android/iOS native projects

### Generate Native Projects
```bash
npx expo prebuild
```

### Clean and Regenerate
```bash
npx expo prebuild --clean
```
> The `--clean` option removes and recreates the `android` and `ios` directories. **Commit any native changes before running this.**

### Platform-Specific Prebuilds
```bash
# Android only
npx expo prebuild --platform android

# iOS only
npx expo prebuild --platform ios
```

### Recommended Upgrade Workflow
```bash
rm -rf node_modules
npm install
npx expo prebuild --clean
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## Building for Production

### Release APK
```bash
cd android
./gradlew assembleRelease
```
**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Android App Bundle (AAB) - Google Play
```bash
cd android
./gradlew bundleRelease
```
**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## Project Reset

When you're ready to start fresh:
```bash
npm run reset-project
```
This moves starter code to the **app-example** directory and creates a blank **app** directory.

---

## Additional Setup

### Linting with ESLint
```bash
npx expo lint
```
[Using ESLint and Prettier Guide](https://docs.expo.dev/guides/using-eslint/)

### Unit Testing with Jest
[Unit Testing Guide](https://docs.expo.dev/develop/unit-testing/)

### TypeScript Configuration
[TypeScript Guide](https://docs.expo.dev/guides/typescript/)

---

## Learn More

- [Expo Documentation](https://docs.expo.dev/) - Fundamentals and advanced topics
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/) - Step-by-step tutorial
- [File-Based Routing](https://docs.expo.dev/router/introduction/) - Understanding the `app` directory structure

---

## Community

Join our community of developers creating universal apps:

- [Expo on GitHub](https://github.com/expo/expo) - Open source platform
- [Discord Community](https://chat.expo.dev) - Chat with Expo users

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.