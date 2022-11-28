# node_package 삭제
if [ -e /frontend/node_modules ]; then
	rm -rf /frontend/node_modules
fi

if [ -e /frontend/package-lock.json ]; then
	rm /frontend/package-lock.json
fi

# 실행
cd /frontend
npm i
npm run serve
