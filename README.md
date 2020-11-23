# MitGen: Mithril App Generator

Is a library that allows developers to develop MithrilJS-based applications by simply providing basic information such as menu names, icons, and their content.
This library allows developers to develop simple to complex applications according to developer needs. The following is how to install this library:

![Screenshot from 2020-11-23 17-49-34](https://user-images.githubusercontent.com/11875540/99953746-4cc0d080-2db4-11eb-99af-cee36233a30b.png)

|Unity|Solar|Cerulean|
|-----|-----|--------|
|<img src="https://user-images.githubusercontent.com/11875540/99954319-1f285700-2db5-11eb-9ed3-eb51ba10a5f1.png" width="200">|<img src="https://user-images.githubusercontent.com/11875540/99954502-762e2c00-2db5-11eb-864f-5f6adde1590e.png"  width="200">|<img src="https://user-images.githubusercontent.com/11875540/99954400-41ba7000-2db5-11eb-9e7d-55618916a5ab.png" width="200">|

## Installation
```
git clone https://github.com/rikyperdana/mitGen yourApp
cd yourApp
npm install -g live-server
```

## Running
```
cd yourApp
live-server
```
and access http://localhost:8080

A dashboard page will appear which is an example of an application built using this library. You can see the material data used to make the entire view in the 
`app.js` file. To be able to understand how to use this library please try changing the contents of the `app.js` file as below.

## API

```
m.mount(document.body, mitGen({
  { // navbar section consists of 3 parts (brand, start, end)
    brand: {
      name: 'home', // required
      full: 'Dashboard', // optional
      // if you don't want to use the default dashboard
      // comp: () => m ('h1', 'My custom dashboard')
    },
    start: {
      myFirstMenu: {
        icon: 'users', // refer to FontAwesome 5 icon list, optional
        full: 'My Profile' // optional
      },
      justAnotherMenu: {
        children: { // optional
          firstSubmenu: {
            icon: 'tag',
            comp: () => m ('h1', 'Hello World!')
          },
          secondSubmenu: {
            icon: 'download',
            comp: () => m ('p', 'Lorem ipsum dolor sit amet')
          }
        }
      }
    },
    end: {
      name: 'userMenu', // required
      full: 'User Management', // optional
      children: { // optional
        signup: {
          full: 'Register now',
          comp: () => m ('p', 'This is the signup page')
        },
        logout: {icon: 'sign-out-alt'}
      }
    }
  },
  { // optional
    theme: 'cerulean' // refer to BulmaSwatch theme code, optional
  }
}))
```

The depth of the menu can only be 2 levels (top menu, sub menu). If your application requires a lot of various pages, try to evenly distribute them on these 2 
levels. By default on the main page rows of cards will be displayed representing the top menu for convenience on mobile devices, and may be replaced with a 
custom page that you create yourself. Applications created with this library will automatically be mobile-friendly which the performance is close to the native 
mobile app.

## Add-ons
This application is equipped with 2 additional libraries, namely autoForm and autoTable:

- [AutoForm](https://github.com/rikyperdana/autoForm): library that allows you to create simple to complex forms by simply writing the data schema.
- [AutoTable](https://github.com/rikyperdana/autoTable): library that allows you to create instant tables by simply providing rows of data and additional 
options, it can be customized

## Dependencies
- MithrilJS
- Lodash JS
- Bulma CSS
- FontAwesome Icons

## Dev TODO
- Routing feature
