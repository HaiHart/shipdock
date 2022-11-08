package server

import (
	"context"

	pb "github.com/HaiHart/shipdock/proto"
	"google.golang.org/grpc"
)

type SerConn struct {
	pb.UnimplementedComServer
	context               context.Context
	cancel                context.CancelFunc
	port int32
	
}