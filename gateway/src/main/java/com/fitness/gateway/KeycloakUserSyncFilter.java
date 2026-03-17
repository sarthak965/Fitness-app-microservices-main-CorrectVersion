package com.fitness.gateway;

import com.fitness.gateway.user.RegisterRequest;
import com.fitness.gateway.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakUserSyncFilter implements WebFilter {
    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");
        return exchange.getPrincipal()
                .cast(org.springframework.security.core.Authentication.class)
                .flatMap(authentication -> {
                    if (!(authentication.getPrincipal() instanceof Jwt jwt)) {
                        return chain.filter(exchange);
                    }

                    RegisterRequest registerRequest = getUserDetails(jwt);
                    String resolvedUserId = userId;

                    if (resolvedUserId == null && registerRequest != null) {
                        resolvedUserId = registerRequest.getKeycloakId();
                    }

                    if (resolvedUserId == null || registerRequest == null) {
                        return chain.filter(exchange);
                    }

                    String finalUserId = resolvedUserId;
                    return userService.validateUser(finalUserId)
                            .flatMap(exist -> {
                                if (Boolean.TRUE.equals(exist)) {
                                    log.info("User already exists, skipping sync.");
                                    return Mono.empty();
                                }
                                log.info("Registering user in user-service for keycloakId: {}", finalUserId);
                                return userService.registerUser(registerRequest).then();
                            })
                            .then(Mono.defer(() -> {
                                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                        .headers(headers -> headers.set("X-User-ID", finalUserId))
                                        .build();
                                return chain.filter(exchange.mutate().request(mutatedRequest).build());
                            }))
                            .onErrorResume(ex -> {
                                log.error("Failed to sync user details for request", ex);
                                return chain.filter(exchange);
                            });
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    private RegisterRequest getUserDetails(Jwt jwt) {
        if (jwt == null) {
            return null;
        }

        try {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(jwt.getClaimAsString("email"));
            registerRequest.setKeycloakId(jwt.getSubject());
            registerRequest.setPassword("dummy@123123");
            registerRequest.setFirstName(jwt.getClaimAsString("given_name"));
            registerRequest.setLastName(jwt.getClaimAsString("family_name"));

            if (registerRequest.getEmail() == null || registerRequest.getKeycloakId() == null) {
                log.warn("Skipping user sync because required JWT claims are missing");
                return null;
            }
            return registerRequest;
        } catch (Exception e) {
            log.error("Unable to extract user details from authenticated JWT", e);
            return null;
        }
    }
}
