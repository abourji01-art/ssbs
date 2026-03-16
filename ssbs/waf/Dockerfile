FROM owasp/modsecurity-crs:nginx-alpine

# Copy SSL certificates
COPY ssl/cert.pem /etc/nginx/ssl/cert.pem
COPY ssl/key.pem  /etc/nginx/ssl/key.pem

# Change permissions as root
USER root
RUN chown -R nginx:nginx /etc/nginx/ssl && \
    chmod 644 /etc/nginx/ssl/cert.pem && \
    chmod 644 /etc/nginx/ssl/key.pem
USER nginx

# Override BOTH nginx config templates to avoid conflicts
COPY conf/nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY conf/empty.template /etc/nginx/templates/conf.d/modsecurity.conf.template

# Add custom WAF rules
COPY conf/custom-rules.conf /etc/modsecurity.d/owasp-crs/rules/RESPONSE-999-CUSTOM.conf

EXPOSE 80 443
