all:
	docker-compose up -d --build

re: clean all

stop:
	docker-compose stop

clean: 
	docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans
	docker system prune --volumes --all --force

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


.PHONY : all re stop clean ps f b d logf logb logd onlyf onlyb onlyd

# sudo lsof -PiTCP -sTCP:LISTEN
