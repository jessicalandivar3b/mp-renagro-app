nvm use v22.17.1
rm -rf www
rm -rf android
npx @capacitor/assets generate
ionic build --prod
npx cap add android
npx @capacitor/assets generate
npx cap sync android
#cp others/cnf/AndroidManifest.xml android/app/src/main/.
npx cap open android
