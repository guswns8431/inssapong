FROM		debian:buster

RUN			apt-get -y update &&\
			apt-get -y upgrade &&\
			apt-get -y install	nodejs \
								npm \
								curl

RUN			npm cache clean -f &&\
			npm install -g n &&\
			npm update -g &&\
			n 16.17.1

COPY		./tools ./backend
WORKDIR		/backend
RUN			npm i
CMD			npm run start:dev
