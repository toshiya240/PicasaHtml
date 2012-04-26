DEST_DIR := ${HOME}/Dropbox/Public/app/PicasaHtml
DEST4TEST_DIR := ${HOME}/Dropbox/Public/app/tmp/PicasaHtml

HTMLFILE4TEST := ${DEST4TEST_DIR}/index.html
JSFILE4TEST := ${DEST4TEST_DIR}/PicasaHtml.js
ICONFILE4TEST := ${DEST4TEST_DIR}/PicasaHtml.png
FILES4TEST := ${HTMLFILE4TEST} ${JSFILE4TEST} ${ICONFILE4TEST}

HTMLFILE := ${DEST_DIR}/index.html
JSFILE := ${DEST_DIR}/PicasaHtml.js
ICONFILE := ${DEST_DIR}/PicasaHtml.png
FILES := ${HTMLFILE} ${JSFILE} ${ICONFILE}

${HTMLFILE4TEST}: index.html
	cp -f $< $@
${JSFILE4TEST}: PicasaHtml.js
	cp -f $< $@
${ICONFILE4TEST}: PicasaHtml.png
	cp -f $< $@

${HTMLFILE}: index.html
	cp -f $< $@
${JSFILE}: PicasaHtml.js
	cp -f $< $@
${ICONFILE}: PicasaHtml.png
	cp -f $< $@

# JS を圧縮してからデプロイすることにすれば
# 必要なときだけコピーされるようになってよいかも。
## 今回は保留
PicasaHtml.min.js: PicasaHtml.js
	yuicompressor -o $@ $<

.PHONY: install
install: ${FILES}

.PHONY: install4test
install4test: ${FILES4TEST}
