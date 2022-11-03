package main

import (
	_ "embed"
	"fmt"
	"strconv"
	// "time"
	"github.com/leaanthony/mewn"
	"github.com/wailsapp/wails"
)

func basic() *Person {
	return &Person{
		Name: "John Doe",
		Address: Address{
			Street: "Nowheresville",
		},
	}
}

var project_name string = mewn.String("dock ship")

type Person struct {
	Name    string
	Address Address
	Parner  *Partner
}

type Address struct {
	Street string
}

type Partner struct {
	Person *Person
}
func action(id string) string{
  return "Hello! " + id
}

type Container struct{
  // Name string `json:"name"`
  // Id int `json:"id"`
  // Placed bool `json:"state"`
  Name string
  Id int 
  Placed int
}

type Basic struct {
  log *wails.CustomLogger
  Counter int `json:"version"`
  Rv []Container
  Log []string
  signal chan string
}

func (b*Basic)getRV(index int) *Container {
  return &Container{
    Id: b.Rv[index].Id,
    Name: b.Rv[index].Name,
    Placed: b.Rv[index].Placed,
  }
}

func (b *Basic) WailsInit(runtime *wails.Runtime) error  {
  b.log = runtime.Log.New("Basic")
  go func() {
    for{
      select {
      case event:=<-b.signal:   
        // for _,v:=range b.Rv{
        //     // runtime.Events.Emit("List", v)
        // }     
        b.Log = append(b.Log, event)
        runtime.Events.Emit("List", b)
      }
      
    }
  }()
  return nil
}

func (b*Basic)Flip(x string, id int) *Basic {
  fmt.Println(x)
  if x == "yes"{
    // b.signal<-"initiate"
    return b
  }
  index,err:= strconv.Atoi(x)
  if err != nil {
    fmt.Printf("%v", err)
    return b
  }
  for k, v := range b.Rv {
    if (v.Id == index ){
      b.Counter++
      if (id == -1){
        (b.Rv)[k] = Container {
          Id: v.Id,
          Name: v.Name,
          Placed: id,
        }
      } else {
        for i,j:= range b.Rv{
          if (j.Placed == id){
            (b.Rv)[i] = Container {
              Id: j.Id,
              Name: j.Name,
              Placed: v.Placed,
            }
          }
        }
        (b.Rv)[k] = Container {
          Id: v.Id,
          Name: v.Name,
          Placed: id,
        }
      }
      
    }
  }
  b.signal<-string(fmt.Sprintf("%d is switch to %d",index, id))
  return b
}


//go:embed frontend/build/static/js/main.js
var js string
// var js string=mewn.String("./frontend/src/index.js")


//go:embed frontend/build/static/css/main.css
var css string
// var css string=mewn.String("./frontend/src/index.css")

func main() {

  app := wails.CreateApp(&wails.AppConfig{
    Width:  1284,
    Height: 960,
    Resizable: true,
    Title:  "DockSetter",
    JS:     js,
    CSS:    css,
    Colour: "#131313",
  })
  Bench:=&Basic{
    Counter: 0,
    Rv: []Container{Container{
      Id: 1,
      Name: "1",
      Placed: -1,
    },
  Container{
    Id: 2,
    Name: "2",
    Placed: -1,
  },
  Container{
    Id: 3,
    Name: "3",
    Placed: -1,
  }},
  signal: make(chan string),
  Log: make([]string, 1),
  }
  app.Bind(Bench)
  app.Bind(action)
  app.Run()
}
