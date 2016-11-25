# History

## 1.1.0

- Can define a route with multiple verbs

```javascript
const router = routerFactory({
  index: {
    url: "/index",
    controller: myController,
    method: ["put", "post"],
  }
});
```

- Can define controller as a function instead of object

```javascript
const router = routerFactory({
  index: {
    url: "/index",
    controller: () => {
      this.body = "My action";
    }
  }
});
```
