FROM nginx:latest

COPY script/cert_config.sh /cert_config.sh
RUN chmod +x /cert_config.sh

ENTRYPOINT ["/cert_config.sh"]
CMD ["nginx", "-g", "daemon off;"]
