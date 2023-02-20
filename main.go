package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"os"
	mx "github.com/gorilla/mux"
	"github.com/leaanthony/mewn"
	"github.com/wailsapp/wails"
	"io/ioutil"
	"net/http"
	"strconv"
	"sync"
	"time"
)

var project_name string = mewn.String("dock ship")

func action(id string) string {
	return "Hello! " + id
}

var Log chan string = make(chan string)

func logFunc()  {
	f, err := os.OpenFile("access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	defer f.Close()
	if err != nil {
		fmt.Println(err)
		return
	}
	for {
		select {
		case log:=<-Log:
			if _, err := f.Write([]byte(log)); err != nil {
				fmt.Println(err)
			}
		}
	}
}
type Position struct {
	XPos float32 `json:"x"`
	YPos float32 `json:"y"`
}

type Container struct {
	Name   string
	Placed int
	Iden   int
	Key    int
}

type Basic struct {
	log     *wails.CustomLogger
	Counter int `json:"version"`
	Rv      []Container
	Log     []string
	signal  chan string
}

func (b *Basic) getRV(index int) *Container {
	return &Container{
		Iden:   b.Rv[index].Iden,
		Name:   b.Rv[index].Name,
		Placed: b.Rv[index].Placed,
	}
}

func (b *Basic) WailsInit(runtime *wails.Runtime) error {
	// runtime.Window.Fullscreen()
	b.log = runtime.Log.New("Basic")
	go func() {
		for {
			select {
			case event := <-b.signal:
				b.Log = append(b.Log, event)
				runtime.Events.Emit("List", b)
			}

		}
	}()
	return nil
}

func (b *Basic) sort() {
	var tmp_1 []Container = make([]Container, 0)
	var tmp_2 []Container = make([]Container, 0)
	for _, v := range b.Rv {
		if v.Placed > -1 {
			tmp_1 = append(tmp_1, v)
		} else {
			tmp_2 = append(tmp_2, v)
		}
	}
	b.Rv = append(tmp_1, tmp_2...)
}

func (b *Basic) Flip(x string, id int) *Basic {
	fmt.Println(x)
	if x == "yes" {
		//  b.signal<-"initiate"
		return b
	}
	var rv string = ""
	index, err := strconv.Atoi(x)
	if err != nil {
		fmt.Printf("%v", err)
		return b
	}
	for k, v := range b.Rv {
		if v.Iden == index {
			b.Counter++
			if id == -1 {
				(b.Rv)[k] = Container{
					Iden:   v.Iden,
					Name:   v.Name,
					Placed: id,
				}
				rv = string(fmt.Sprintf("%d is moved to %d at %v", index, id, time.Now().Format(time.ANSIC)))
			} else {
				for i, j := range b.Rv {
					if j.Placed == id {
						(b.Rv)[i] = Container{
							Iden:   j.Iden,
							Name:   j.Name,
							Placed: v.Placed,
						}
						rv = string(fmt.Sprintf("%d is switched with %d at %v", index, j.Iden, time.Now().Format(time.ANSIC)))
					}
				}
				(b.Rv)[k] = Container{
					Iden:   v.Iden,
					Name:   v.Name,
					Placed: id,
				}
				if len(rv) < 1 {
					rv = string(fmt.Sprintf("%d is moved to %d at %v", index, id, time.Now().Format(time.ANSIC)))
				}
			}

		}
	}
	// b.sort()
	b.signal <- rv
	return b
}

func (b *Basic) SetImageFile(x, y float32) string {

	toJson := Position{
		XPos: x,
		YPos: y,
	}
	file, err := json.Marshal(toJson)
	if err != nil {
		return fmt.Sprintln((err))
	}

	_ = ioutil.WriteFile("./Config.json", file, 0644)

	return "success"
}

func (b *Basic) RemoveImage() string {
	if err := os.Remove("./image.jpg"); err != nil {
		return fmt.Sprintln(err)
	}
	return "Success"
}

func (b *Basic) GetImageFile() interface{} {
	jsonFile, err := os.Open("./Config.json")
	if err != nil {
		fmt.Println(err)
		return Position{
			XPos: 0,
			YPos: 0,
		}
	}
	defer jsonFile.Close()
	content, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return Position{
			XPos: 0,
			YPos: 0,
		}
	}

	var rv Position

	json.Unmarshal(content, &rv)

	return rv
}

//go:embed frontend/build/static/js/main.js
var js string

//go:embed frontend/build/static/css/main.css
var css string

func imgLoader(w http.ResponseWriter, r *http.Request) {
	var Path = "./" + "image.jpg"
	img, err := ioutil.ReadFile(Path)
	if err != nil {
		Log<-fmt.Sprintf("%v",err)
		fmt.Print(err)
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-type", "img/jpeg")
	w.Write(img)
}

func imgUpload(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 30)
	file, handler, err := r.FormFile("Img")
	if err != nil {
		Log<-fmt.Sprintf("%v",err)
		fmt.Println(err)
		return
	}
	defer file.Close()
	fmt.Printf("Uploaded File: %+v\n", handler.Filename)
	fmt.Printf("File Size: %+v\n", handler.Size)
	fmt.Printf("MIME Header: %+v\n", handler.Header)
	tmpFile, err := os.Create("./image.jpg")
	if err != nil {
		return
	}
	defer tmpFile.Close()
	if _, err := io.Copy(tmpFile, file); err != nil {
		Log<-fmt.Sprintf("%v",err)
		fmt.Println(err)
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Yes")
}

func checkConn(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Header().Add("Accept-Charset", "utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Yes")
}

func runServer(wg *sync.WaitGroup) {
	defer wg.Done()
	wg.Add(1)
	r := mx.NewRouter()
	r.HandleFunc("/img", imgLoader)
	r.HandleFunc("/Conn", checkConn)
	r.HandleFunc("/save", imgUpload)
	http.Handle("/", r)
	err := http.ListenAndServe(":5000", nil)
	if err != nil {
		fmt.Println(err)
	}
}

func runWails() {

	app := wails.CreateApp(&wails.AppConfig{
		Width:     1280,
		Height:    960,
		Resizable: true,
		Title:     "DockSetter",
		JS:        js,
		CSS:       css,
		Colour:    "#131313",
	})
	Bench := &Basic{
		Counter: 0,
		Rv: []Container{{
			Iden:   1,
			Name:   "1",
			Placed: -1,
			Key:    0,
		},
			{
				Iden:   2,
				Name:   "2",
				Placed: -1,
				Key:    1,
			},
			{
				Iden:   3,
				Name:   "3",
				Placed: -1,
				Key:    2,
			}},
		signal: make(chan string),
		Log:    make([]string, 1),
	}
	app.Bind(Bench)
	app.Bind(action)
	app.Run()
}

func main() {
	var wg sync.WaitGroup

	go logFunc()
	go runServer(&wg)
	runWails()

	wg.Wait()
	defer fmt.Println("DONE")
}
