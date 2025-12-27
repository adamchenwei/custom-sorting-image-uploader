# React Native with Expo - Tooling Context v1

- **Tech Stack**: 
    - React Native (via Expo SDK 54+)
    - Node.js 20.10.0+
    - TypeScript
    - Jest (For Unit Testing)
    - Read additional tools context in `_agent-guide/app-definations/tools-context` folder if exists.

- **Platform Support**:
    - Primary: Android 12+ (API 31+)
    - Secondary: iOS (if needed)
    - Expo SDK 54+ requires development builds for native modules

- **Key Dependencies**:
    - `expo` - Core Expo SDK
    - `expo-dev-client` - Required for development builds (NOT Expo Go)
    - `react-native-safe-area-context` - Safe area handling (replaces deprecated SafeAreaView)
    - `@react-native-async-storage/async-storage` - Local storage
    - `expo-media-library` - Photo/media access
    - `expo-notifications` - Push notifications
    - `expo-file-system` - File system access
    - `expo-image-manipulator` - Image processing

- **Important Limitations**:
    - **Expo Go cannot be used** for apps with:
        - `expo-notifications` (removed from Expo Go in SDK 53+)
        - `expo-media-library` (limited permissions in Expo Go)
    - Must use **development builds** for full native module support
    - Always use `SafeAreaView` from `react-native-safe-area-context`, NOT from `react-native`

- **Environment Validation**:
    - Verify Node.js version: `node --version` should show v20.10.0+
    - Use nvm if needed: `source ~/.nvm/nvm.sh && nvm use`
    - Verify Expo CLI: `npx expo --version`
    - Check Android SDK is installed for local builds

- **Version Management**:
    - Version file: `package.json`
    - Read current version: `node -p "require('./package.json').version"`
    - Update version field in package.json using `edit` tool
    - Commit command: `git add package.json && git commit -m "chore(version): bump version to X.Y.Z" && git push`

- **Build Commands**:
    - **Development Build (Android)**:
        ```bash
        npx expo prebuild --clean --platform android
        npx expo run:android
        ```
    - **Development Server** (for already-built apps):
        ```bash
        npx expo start --dev-client
        ```
    - **Production APK** (via EAS Build):
        ```bash
        npx eas build --platform android --profile production
        ```
    - **Local APK Build**:
        ```bash
        npx expo prebuild --platform android
        cd android && ./gradlew assembleRelease
        # APK at: android/app/build/outputs/apk/release/
        ```
    - **TypeScript Check**: `npx tsc --noEmit`
    - **Export Bundle**: `npx expo export --platform android`

- **Code Quality Standards**:
    - Use TypeScript strict mode
    - Use camelCase for variables/functions and PascalCase for classes/interfaces/components
    - No console.log statements in production code
    - All TypeScript errors must be resolved before commit
    - No unused imports or variables
    - Always wrap app with `SafeAreaProvider` from `react-native-safe-area-context`

- **App Configuration** (`app.json`):
    - Configure Android permissions in `expo.android.permissions`
    - Use plugins array for native module configuration:
        ```json
        "plugins": [
          ["expo-media-library", { "photosPermission": "...", "audioPermission": false }],
          ["expo-notifications", { "icon": "...", "color": "..." }]
        ]
        ```
    - Set `expo.android.package` for Android package name

- **Permissions Handling**:
    - Always check and request permissions before using native features
    - Create a dedicated PermissionsScreen for first-launch permission requests
    - Handle "denied" state by directing users to app settings

- **Testing**:
    - Unit tests with Jest: `npm test`
    - For device testing, always use development builds
    - Test on physical devices for camera/media/notification features

- **Common Issues & Solutions**:
    - **"Audio permission not declared"**: Set `audioPermission: false` in expo-media-library plugin config
    - **SafeAreaView deprecated**: Use `react-native-safe-area-context` instead
    - **Expo Go errors**: Create development build with `npx expo run:android`
    - **Build cache issues**: Use `npx expo prebuild --clean`

- **Project Structure**:
    ```
    ├── App.tsx                 # Main app entry
    ├── app.json               # Expo configuration
    ├── src/
    │   ├── components/        # UI components
    │   ├── services/          # Business logic
    │   ├── hooks/             # Custom hooks
    │   ├── types/             # TypeScript types
    │   └── utils/             # Utilities
    ├── assets/                # Images, icons, fonts
    ├── android/               # Generated Android project (after prebuild)
    └── ios/                   # Generated iOS project (after prebuild)
    ```
