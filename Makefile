all:
	docker-compose up -d --build

re: clean all

stop:
	docker-compose stop

clean: stop
	docker-compose down

ps:
	docker-compose ps

f:
	docker exec -it container_frontend /bin/sh

b:
	docker exec -it container_backend /bin/sh

d:
	docker exec -it container_database /bin/sh

logf:
	docker logs container_frontend

logb:
	docker logs container_backend

logd:
	docker logs container_database

onlyf:
	docker-compose start frontend

onlyb:
	docker-compose start backend

onlyd:
	docker-compose start database

.PHONY : all re stop clean ps

# docker container stop $(docker ps -a -q) &&\
# docker rmi -f $(docker images -qa) &&\
# docker volume rm $(docker volume ls -q) &&\
# docker system prune

# sudo lsof -PiTCP -sTCP:LISTEN
