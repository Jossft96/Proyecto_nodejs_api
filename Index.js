import express, { json } from 'express';
import fs from 'fs';
import bodyparser from 'body-parser';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyparser.json());

app.listen( PORT, () => {
     console.log (`Servidor escuchando en el puerto ${PORT}`);
});

const ReadData = ()=>{
    try {
        const data = fs.readFileSync("./db.json");
        return JSON.parse(data);
        
    } catch (error) {
        
        console.log (error);

    }
};

const WriteData = (data)=>{
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data));
        
    } catch (error) {
        
        console.log (error);
        
    }
};

const ReadUser =() =>{
    try {

        const data = fs.readFileSync("./user.json");
        return JSON.parse(data).users;

    } catch (error) {

        console.log(error);
    }
}

const ReadContainer =() =>{
    try {

        const data = fs.readFileSync("./container.json");
        return JSON.parse(data);

    } catch (error) {

        console.log(error);
    }
}

const WriteContainer = (data)=>{
    try {
        fs.writeFileSync("./container.json", JSON.stringify(data));
        
    } catch (error) {
        
        console.log (error);
        
    }
};


function GetUniqueDistricts(data) {
  const allDistricts = data.collections.map(c => c.container.district);
  const uniqueDistricts = [...new Set(allDistricts)];
  return uniqueDistricts;
}

function GetAvenuesByDistrict(data, district) {
  const filtered = data.collections.filter(
    (c) => c.container.district.toLowerCase() === district.toLowerCase()
  );

  const avenues = filtered.map((c) => c.container.avenue);
  const uniqueAvenues = [...new Set(avenues)];

  return uniqueAvenues;
}


app.get("/", (req, res) =>{

    res.send("Welcome nodejs");

});

app.get("/api/Districts", (req, res) =>{
    const data =ReadData();
    const districts = GetUniqueDistricts(data);
    res.json(districts);
});

app.get("/api/Avenues", (req, res) =>{
    const data =ReadData();
    const {district} = req.query;
    const avenues = GetAvenuesByDistrict(data,district);
    res.json(avenues);
});

app.get("/api/Collections/ContainerSearch/", (req, res) =>{
    const data =ReadData();
    const {district , avenue} = req.query;
    const results = data.collections.filter((collection) => {
        return(
        collection.container.district.toLowerCase() === district.toLowerCase() &&
        collection.container.avenue.toLowerCase() === avenue.toLowerCase()
        );
    })

    .map(collection => collection.container);

    res.json(results);
});

app.get("/api/Collections/Container/:id", (req, res) =>{
    const data =ReadData();
    const id = req.params.id;
    const results = data.collections.filter((collection) => collection.container.container_id === id);
    res.json(results);
});


app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = ReadUser();

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

app.get("/api/collections", (req, res)=>{
    const data = ReadData();
    res.json(data.collections);
});

app.get("/api/collections/:id", (req, res) => {
    const data = ReadData();
    const id = parseInt(req.params.id);
    const result = data.collections.find((collection) => collection.id === id);
    res.json(result);
});

app.post("/api/collections", (req, res) =>{
    const data = ReadData();
    const body = req.body;
    const NewCollection ={
        id: data.last_id += 1,
        ...body,
    };
    data.collections.push(NewCollection);
    WriteData(data);
    res.json(NewCollection);
});

app.put("/api/collections/:id", (req, res)=>{
    const data = ReadData();

    const body = req.body;

    const id = parseInt(req.params.id);

    const index = data.collections.findIndex((collection) => collection.id === id);

    data.collections[index] = {
        ...data.collections[index],
        ...body,
    };

    WriteData(data);

    res.json({message: "success"});

});

app.delete("/api/collections/:id" , (req, res) =>{
    
    const data = ReadData();

    const id = parseInt(req.params.id);

    const index = data.collections.findIndex((collection) => collection.id === id);

    data.collections.splice(index,1);
    
    WriteData(data);

    res.json({ message : "delete success"});
})

app.get("/api/containers", (req, res)=>{
    const data = ReadContainer();
    res.json(data);
});

app.get("/api/containers/:id", (req, res) => {
    const data = ReadContainer();
    const id = parseInt(req.params.id);
    const result = data.containers.find((container) => container.id === id);
    res.json(result);
});

app.post("/api/containers", (req, res) =>{
    const data = ReadContainer();
    const body = req.body;
    const NewContainer ={
        id: data.last_id +=1,
        ...body,
    };
    data.containers.push(NewContainer);
    WriteContainer(data);
    res.json(NewContainer);
});

app.put("/api/containers/:id", (req, res)=>{
    const data = ReadContainer();

    const body = req.body;

    const id = parseInt(req.params.id);

    const index = data.containers.findIndex((container) => container.id === id);

    data.containers[index] = {
        ...data.containers[index],
        ...body,
    };

    WriteContainer(data);

    res.json({message: "success"});

});

app.delete("/api/containers/:id" , (req, res) =>{
    
    const data = ReadContainer();

    const id = parseInt(req.params.id);

    const index = data.containers.findIndex((container) => container.id === id);

    data.containers.splice(index,1);
    
    WriteContainer(data);

    res.json({ message : "delete success"});
})

