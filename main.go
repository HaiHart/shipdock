package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	pb "github.com/HaiHart/ShipdockServer/proto"
	mx "github.com/gorilla/mux"
	"github.com/leaanthony/mewn"
	"github.com/wailsapp/wails"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var project_name string = mewn.String("dock ship")

func action(id string) string {
	return "Hello! " + id
}

var Log chan string = make(chan string)

func logFunc() {
	f, err := os.OpenFile("access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	defer f.Close()
	if err != nil {
		fmt.Println(err)
		return
	}
	for {
		select {
		case log := <-Log:
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

type Command struct {
	name  string
	place int
}

type Basic struct {
	log          *wails.CustomLogger
	runtime      *wails.Runtime
	Counter      int `json:"version"`
	Rv           []Container
	Log          []string
	signal       chan string
	client       pb.ComClient
	ctx          context.Context
	cancle       context.CancelFunc
	streamConn   pb.Com_MoveContainerClient
	storeCommand chan pb.Pack
}

func (b *Basic) connectServer() {
	var opts []grpc.DialOption
	opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	conn, err := grpc.Dial(fmt.Sprintf("localhost:%v", 8080), opts...)
	if err != nil {
		fmt.Println(err)
	}
	b.client = pb.NewComClient(conn)
	// defer conn.Close()
}

func (b *Basic) FetchFromServer() error {
	ShipList, err := b.client.FetchList(b.ctx, &pb.Header{Time: timestamppb.Now()})
	if err != nil {
		return err
	}
	b.Rv = make([]Container, 0)
	for _, v := range ShipList.List {
		id, _ := strconv.Atoi(v.Id)
		b.Rv = append(b.Rv, Container{
			Name:   v.Name,
			Iden:   id,
			Key:    int(v.Key),
			Placed: int(v.Place),
		})
	}
	return nil
}

func (b *Basic) createServerChannel() error {
	stream, err := b.client.MoveContainer(b.ctx)
	if err != nil {
		fmt.Println(err)
	}
	// waitc := make(chan struct{})
	go func() {
		b.streamConn = stream
		for {
			in, err := stream.Recv()
			// if err == io.EOF {
			// 	close(waitc)
			// 	return
			// }
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println(in.List[0].Id, int(in.List[0].NewPlace))
			b.Change(in.List[0].Id, int(in.List[0].NewPlace))
		}
	}()
	go func() {
		fmt.Println("runnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
		for {
			select {
			case commmand := <-b.storeCommand:
				err := stream.Send(&commmand)
				if err != nil {
					fmt.Println("send command to somewhere: %v", err)
				}
				fmt.Println("Yesssssssssssss")
			}
		}
	}()

	// <-waitc
	return nil
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
	b.runtime = runtime
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


func (b *Basic) Flip(x string, id int) *Basic {
	fmt.Println(x)
	if x == "yes" {
		return b
	}
	index, err := strconv.Atoi(x)
	if err != nil {
		fmt.Printf("%v", err)
		return b
	}
	var change, change_2 *pb.Container
	for _, v := range b.Rv {
		if v.Iden == index {
			b.Counter++
			change = &pb.Container{
				Id:       strconv.FormatInt(int64(v.Iden),10),
				Name:     v.Name,
				Place:    int32(v.Placed),
				NewPlace: int32(id),
				Time:     timestamppb.Now(),
			}
			if id != -1 {
				for i, j := range b.Rv {
					if j.Placed == id {
						(b.Rv)[i] = Container{
							Iden:   j.Iden,
							Name:   j.Name,
							Placed: v.Placed,
						}
						change_2 = &pb.Container{
							Id:       strconv.FormatInt(int64(j.Iden),10),
							Name:     j.Name,
							Place:    int32(j.Placed),
							NewPlace: int32(v.Placed),
							Time:     timestamppb.Now(),
						}
					}
				}

			}

		}
	}
	var ls = pb.Pack{
		List: []*pb.Container{
			change,
			change_2,
		},
		Swap: (change_2 != nil),
		Err:  "None",
	}
	b.storeCommand <- ls
	fmt.Println("Here!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	return b
}

func (b *Basic) Change(x string, id int) *Basic {
	fmt.Println("receive from server: ", x)

	index, err := strconv.Atoi(x)
	if err != nil {
		fmt.Printf("%v", err)
		return b
	}
	var rv string = ""

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
		Log <- fmt.Sprintf("%v", err)
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
		Log <- fmt.Sprintf("%v", err)
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
		Log <- fmt.Sprintf("%v", err)
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
	err := http.ListenAndServe(":4000", nil)
	if err != nil {
		fmt.Println(err)
	}
}

func runWails() {

	app := wails.CreateApp(&wails.AppConfig{
		Width:     1100,
		Height:    800,
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
		ctx:    context.Background(),
		storeCommand: make(chan pb.Pack),
	}
	go func() {
		var group errgroup.Group
		Bench.connectServer()
		group.Go(Bench.FetchFromServer)
		group.Go(Bench.createServerChannel)
		err := group.Wait()
		if err != nil {
			fmt.Println(err)
			return
		}
	}()
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
