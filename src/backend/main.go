package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.New()
	if err := router.SetTrustedProxies(nil); err != nil {
		log.Fatal(err)
	}

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
