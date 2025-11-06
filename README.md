# VARIABLES DE ENTORNO NECESARIAS

configurar variables de ambiente  en ~/.zshrc

````
# ANDROID
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
````

# version de node

````
nvm use v22.17.1
````

# generar componentes

ionic generate page pages/home
ng generate component components/mp-input-error --standalone

# Librerias 

Librerias que se necersitan instalar

````
npm install -g @ionic/cli @angular/cli

npm install @capacitor/android
npm install @capacitor/assets --save-dev

#gps
npm install @capacitor/geolocation

npm install uuid

````

Revisar los permisos en

[Abrir AndroidManifest.xml](android/app/src/main/AndroidManifest.xml)



# ejecutar

- instalar paquetes

````
npm install
````

## Ejecutar modo desarrollo

````
ionic serve -o
````

## Ejecutar en un dispositivo

- El dispositivo debe tener activado el modo desarrollo
- Estar conectado al equipo por un cable
- Aceptar los permisos que se solicitan en el pc y en el telefono

````
ionic cap run android -l --external
````
- -l: Live-Reload.
- --external: Permite que el celular se conecte al servidor de desarrollo

### Ver logs 
- En el navegador ejecutar
chrome://inspect/#devices

- Aparece el dispositivo seleccionas inspect

# Generar apk

Actualizar la version en: android/app/build.gradle

[Abrir build.gradle de Android](android/app/build.gradle)
[Abrir environment.ts](src/environments/environment.prod.ts)

```
	versionCode 3
	versionName "1.0.3"
```

[Abrir build.gradle de Android](others/cnf/cnf.sh)

```
#Genera la versión de producción
ionic build --prod

#Sincroniza los cambios con el proyecto Android
npx cap sync android

#Abre el proyecto nativo en Android Studio
npx cap open android



```

Se abre automatiamente android studio

- generar apk en android studio

Build
Gnerate App Bundles or APKs
Generate APKs


# Adicionales

## En android studio

### configurar a un graddle mas actual  12

gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.12-all.zip
Sync Graddle Project



