# A MySQL table controller supporting caching

### A library using which user can get handle to mysql tables and views, with a nice table operation interface and inherent caching of table data as bonus.

###### Example:
```javascript
var table=await getTableController({table:'User',database:'root'})

await table.findUser({..user fields..});
await table.updateUser({..user fields with user key field..});
await table.getUser({..user key..});
await table.addUser({..user fields without key field..});
await table.removeUser({..user key field..})

```
