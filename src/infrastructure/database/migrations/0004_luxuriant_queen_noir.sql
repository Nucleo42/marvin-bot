CREATE INDEX "ban_guild_id_idx:" ON "auto_ban_config" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "flow_guild_id_idx:" ON "server_event_flow" USING btree ("guild_id");