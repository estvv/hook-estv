pull:
	git pull

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

build:
	docker-compose build

update: pull
	docker-compose down
	docker-compose build
	docker-compose up -d

clean:
	docker-compose down -v
	rm -rf data/*

status:
	docker-compose ps