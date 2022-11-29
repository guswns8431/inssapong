# node_package 삭제
# if [ -e /backend/node_modules ]; then
# 	rm -rf /backend/node_modules
# fi

# if [ -e /backend/package-lock.json ]; then
# 	rm /backend/package-lock.json
# fi

# if [ -e /backend/dist ]; then
# 	rm -rf /backend/dist
# fi

# 실행
cd /backend
# npm i
npm run start:dev
