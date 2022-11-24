package main

import (
	_ "embed"
	"fmt"
	"time"

	// "sort"
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
  Placed int
  Iden int 
  Key int 
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
    Iden: b.Rv[index].Iden,
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

func (b*Basic)sort()  {
  var tmp_1 []Container = make([]Container, 0)
  var tmp_2 []Container = make([]Container, 0)
  for _, v := range b.Rv {
    if v.Placed>-1{
      tmp_1 = append(tmp_1, v)
    }else{
      tmp_2 = append(tmp_2, v)
    }
  }
  b.Rv = append(tmp_1, tmp_2...)
}

func (b*Basic)Flip(x string, id int) *Basic {
  fmt.Println(x)
  if x == "yes"{
    //  b.signal<-"initiate"
    return b
  }
  var rv string = ""
  index,err:= strconv.Atoi(x)
  if err != nil {
    fmt.Printf("%v", err)
    return b
  }
  for k, v := range b.Rv {
    if (v.Iden == index ){
      b.Counter++
      if (id == -1){
        (b.Rv)[k] = Container {
          Iden: v.Iden,
          Name: v.Name,
          Placed: id,
        }
        rv = string(fmt.Sprintf("%d is moved to %d at %v",index, id, time.Now().Format(time.ANSIC)))
      } else {
        for i,j:= range b.Rv{
          if (j.Placed == id){
            (b.Rv)[i] = Container {
              Iden: j.Iden,
              Name: j.Name,
              Placed: v.Placed,
            }
          rv = string(fmt.Sprintf("%d is switched with %d at %v",index, j.Iden, time.Now().Format(time.ANSIC)))
          }
        }
        (b.Rv)[k] = Container {
          Iden: v.Iden,
          Name: v.Name,
          Placed: id,
        }
        if len(rv) <1{
          rv = string(fmt.Sprintf("%d is moved to %d at %v",index, id, time.Now().Format(time.ANSIC)))
        }
      }
      
    }
  }
  // b.sort()
  b.signal<-rv
  return b
}


//go:embed frontend/build/static/js/main.js
var js string


//go:embed frontend/build/static/css/main.css
var css string

func main() {

  app := wails.CreateApp(&wails.AppConfig{
    Width:  1280,
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
      Iden: 1,
      Name: "1",
      Placed: -1,
      Key: 0,
    },
  Container{
    Iden: 2,
    Name: "2",
    Placed: -1,
    Key: 1,
  },
  Container{
    Iden: 3,
    Name: "3",
    Placed: -1,
    Key: 2,
  }},
  signal: make(chan string),
  Log: make([]string, 1),
  }
  app.Bind(Bench)
  app.Bind(action)
  app.Run()
}
