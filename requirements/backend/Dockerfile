FROM	debian:buster

RUN		apt-get -y update &&\
		apt-get -y upgrade &&\
		apt-get -y install	nodejs \
							npm \
							curl

RUN		npm cache clean -f &&\
		npm install -g n &&\
		npm update -g &&\
		n 16.17.1

COPY	./start.sh ./
RUN		chmod +x ./start.sh
CMD		bash ./start.sh
